/**
 * This file is part of the Crypto Trader JavaScript starter bot
 *
 * Last update: February 27, 2018
 *
 * @author Dino Hensen <dino@riddles.io>
 * @License MIT License (http://opensource.org/Licenses/MIT)
 */
module.exports = class Chart {
    constructor() {
        this.candles = [];
    }

    addCandle(candle) {
        this.candles.push(candle);
    }

    getCandleAt(idx) {
        return this.candles[idx];
    }

    getLastCandle() {
        return this.candles[this.candles.length - 1];
    }

    length() {
        return this.candles.length;
    }
};
