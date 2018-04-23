/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * Track the trade of a commodity from one trader to another
 * @param {com.basaki.network.Trade} trade - the trade to be processed
 * @transaction
 */
async function tradeCommodity(trade) {
    // update the commodity owner with the new owner
    trade.commodity.owner = trade.newOwner;

    // retrieve the asset registry for the commodity
    let assetRegistry = await getAssetRegistry('com.basaki.network.Commodity');

    // update the commodity in the asset registry
    await assetRegistry.update(trade.commodity);
}
