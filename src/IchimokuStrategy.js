/**
 * This file is part of the Crypto Trader JavaScript starter bot
 *
 * Last update: February 27, 2018
 *
 * @author Dino Hensen <dino@riddles.io>
 * @License MIT License (http://opensource.org/Licenses/MIT)
 */
const Order = require('./Order');

module.exports = class IchimokuStrat {
    constructor() {
        this.tenkanVSkijun = new Map();
        this.tenkanVSkijun.set('USDT_ETH', undefined);
        this.tenkanVSkijun.set('USDT_BTC', undefined);
        this.timeSinceCrossUp = new Map();
        this.timeSinceCrossUp.set('USDT_ETH', []);
        this.timeSinceCrossUp.set('USDT_BTC', []);
        this.timeSinceCrossDown = new Map();
        this.timeSinceCrossDown.set('USDT_ETH', []);
        this.timeSinceCrossDown.set('USDT_BTC', []);
    }

    execute(gameSettings, state) {
        const dollars = state.stacks['USDT'];
        const ETHClosePrice = state.charts['USDT_ETH'].getLastCandle().close;
        const BTCClosePrice = state.charts['USDT_BTC'].getLastCandle().close;
        const ETHAmount = dollars / (2 * ETHClosePrice);
        const BTCAmount = dollars / (2 * BTCClosePrice);

        const ETHOrder = this.findOrder(state.charts, 'USDT_ETH', ETHAmount, state.stacks["ETH"]);
        const BTCOrder = this.findOrder(state.charts,'USDT_BTC', BTCAmount, state.stacks["BTC"]);

        return IchimokuStrat.pass_order(ETHOrder, BTCOrder).toString();
    }
    
    static pass_order(ETHOrder, BTCOrder) {
        if (!ETHOrder && !BTCOrder)
            return 'pass';
        if (!BTCOrder)
            return ETHOrder.toString();
        if (!ETHOrder)
            return BTCOrder.toString();
        return ETHOrder.toString() + ";" + BTCOrder.toString();
    }

    static getTenkanSen(chart) {
        return IchimokuStrat.getPeriodExtrems(chart, 9);
    }

    static getKijunSen(chart) {
        return IchimokuStrat.getPeriodExtrems(chart, 26);
    }

    static getSenkouSpanA(kijun, tenkan) {
        return (kijun + tenkan) / 2;
    }

    static getSenkouSpanB(chart) {
        return IchimokuStrat.getPeriodExtrems(chart, 52);
    }

    static getChikouSpan(chart) {
        return chart[chart.length - 27];
    }

    static getPeriodExtrems(chart, size) {
        let min;
        let max;
        const chartLen = chart.length();

        for (let step = chartLen - size; step < chartLen - 1; ++step) {
            const val = chart.getCandleAt(step).close;
            if (!min || min > val)
                min = val;
            if (!max || max < val)
                max = val;
        }
        return (min + max) / 2.0;
    }

    findOrder(charts, pair, amount, CurrencyPossessed) {
        const chart = charts[pair];
        const TenkanSen = IchimokuStrat.getTenkanSen(chart);
        const KijunSen = IchimokuStrat.getKijunSen(chart);
        const SenkouSpanA = IchimokuStrat.getSenkouSpanA(KijunSen, TenkanSen);
        const SenkouSpanB = IchimokuStrat.getSenkouSpanB(chart);
        const ChikouSpan = IchimokuStrat.getChikouSpan(chart);
        const ClosePrice = chart.getLastCandle().close;

        this.updateCrossing(TenkanSen, KijunSen, pair);
        this.updateTimeSinceCross(pair);
        if (amount > 0 && this.timeSinceCrossUp.get(pair).length > 0 && ClosePrice > SenkouSpanA && ClosePrice > SenkouSpanB)
            return new Order('buy', pair, amount);
        if (CurrencyPossessed > 0 && this.timeSinceCrossDown.get(pair).length > 0 && ClosePrice < SenkouSpanB && ClosePrice < SenkouSpanA)
            return new Order('sell', pair, CurrencyPossessed);
        return null;
    }

    updateCrossing(TenkanSen, KijunSen, pair) {
        const crossing = TenkanSen > KijunSen;

        if (crossing !== this.tenkanVSkijun.get(pair)) {
            this.tenkanVSkijun.set(pair, crossing);
            if (crossing)
                this.timeSinceCrossUp.get(pair).push(0);
            else
                this.timeSinceCrossDown.get(pair).push(0);
        }
    }

    updateTimeSinceCross(pair) {
        this.timeSinceCrossUp.get(pair).forEach(function (val, idx) {
            ++(this[idx]);
        }, this.timeSinceCrossUp.get(pair));
        this.timeSinceCrossDown.get(pair).forEach(function (val, idx) {
            ++(this[idx]);
        }, this.timeSinceCrossDown.get(pair));
        this.timeSinceCrossUp.set(pair, this.timeSinceCrossUp.get(pair).filter(function (val) {
            return val <= 4
        }));
        this.timeSinceCrossDown.set(pair, this.timeSinceCrossDown.get(pair).filter(function (val) {
            return val <= 4
        }));
    }
};