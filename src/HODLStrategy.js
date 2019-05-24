/**
 * This file is part of the Crypto Trader JavaScript starter bot
 *
 * Last update: February 27, 2018
 *
 * @author Dino Hensen <dino@riddles.io>
 * @License MIT License (http://opensource.org/Licenses/MIT)
 */
const Order = require('./Order');

module.exports = class HODLStrategy {
    constructor() {}

    execute(gameSettings, state) {
        const dollars = state.stacks['USDT'];
        const ETH = state.stacks['ETH'];
        const BTC = state.stacks['BTC'];
        const ETHClosePrice = state.charts['USDT_ETH'].getCandleAt(state.date).close;
        const ETHEnterPrice = state.charts['USDT_ETH'].getCandleAt(state.date).open;
        const BTCClosePrice = state.charts['USDT_BTC'].getCandleAt(state.date).close;
        const BTCEnterPrice = state.charts['USDT_BTC'].getCandleAt(state.date).open;
        const ETHamount = dollars / (2 * ETHClosePrice);
        const BTCamount = dollars / (2 * BTCClosePrice);
        var ETHOrder = null;
        var BTCOrder = null;
        
        if (ETHClosePrice > ETHEnterPrice && ETH > 0)
            ETHOrder = new Order('sell', 'USDT_ETH', ETH);
        else if (ETHClosePrice < ETHEnterPrice && ETHAmount > 0)
            ETHOrder = new Order('buy', 'USDT_ETH', ETHAmount);
        if (BTCClosePrice > BTCEnterPrice && BTC > 0)
            BTCOrder = new Order('sell', 'USDT_BTC', BTC);
        else if (BTCClosePrice < BTCEnterPrice && BTCAmount > 0)
            BTCOrder = new Order('buy', 'USDT_BTC', BTCAmount);
        return this.pass_order(ETHOrder, BTCOrder);
    }
    
    pass_order(ETHOrder, BTCOrder) {
        if (!ETHOrder && !BTCOrder)
            return 'pass';
        if (!BTCOrder)
            return ETHOrder.toString();
        if (!ETHOrder)
            return BTCOrder.toString();
        return ETHOrder.toString() + ";" + BTCOrder.toString();
    }
};
