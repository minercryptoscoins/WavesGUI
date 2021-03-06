(function () {
    'use strict';

    /**
     * @param Base
     * @param {JQuery} $element
     * @param {TimeLine} timeLine
     * @return {DexPair}
     */
    const controller = function (Base, $element, timeLine) {

        class DexPair extends Base {

            constructor() {
                super();
                /**
                 * @type {string}
                 */
                this.assetId = null;
                /**
                 * @type {string}
                 */
                this.baseAssetId = null;
                this._requestTimer = null;
            }

            $postLink() {
                if (!this.assetId) {
                    throw new Error('Has no asset id!');
                }
                this.observe('baseAssetId', this._onChangeAssetId);
                this._onChangeAssetId();
            }

            /**
             * @private
             */
            _onChangeAssetId() {
                if (this._requestTimer) {
                    timeLine.cancel(this._requestTimer);
                }
                if (this.assetId && this.baseAssetId) {
                    Waves.AssetPair.get(this.assetId, this.baseAssetId)
                        .then((pair) => {
                            const amount = pair.amountAsset.displayName;
                            const price = pair.priceAsset.displayName;
                            this._addTemplate(`${amount} / ${price}`);
                        }, () => {
                            timeLine.timeout(() => this._onChangeAssetId(), 1000);
                        });
                } else {
                    this._addTemplate('');
                }
            }

            /**
             * @param {string} pair
             * @private
             */
            _addTemplate(pair) {
                $element.html(pair);
                $element.attr('title', pair);
            }

        }

        return new DexPair();
    };

    controller.$inject = ['Base', '$element', 'timeLine'];

    angular.module('app.dex').component('wDexPair', {
        bindings: {
            assetId: '@',
            baseAssetId: '<'
        },
        transclude: false,
        controller
    });
})();
