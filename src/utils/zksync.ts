import { ethers } from "ethers";
import { create2Address } from "zksync-ethers/build/utils";
import { V1_FACTORY_ADDRESSES } from "../constants/v1";
import { ChainId } from "../constants";
import { Trade, Route } from '@uniswap/sdk';

const UNISWAP_V2_PAIR_CREATION_CODE_HASH = "0x010003f780a69feb64d9f9fb41ca041f2112ef96d907861beddc876def8bb680"

export const getZksyncPairAddress = (chainId: ChainId, token0: string, token1: string): string => {
    const salt = ethers.utils.keccak256(ethers.utils.solidityPack(["address", "address"], [token0, token1]));
    const hash = ethers.utils.arrayify(UNISWAP_V2_PAIR_CREATION_CODE_HASH);
    return create2Address(V1_FACTORY_ADDRESSES[chainId], hash, salt, []);
}


export class PatchedTrade extends Trade {
    constructor(original: Trade, newRoute: Route) {
        // Call original constructor with the same values
        super(
            original.route,
            original.inputAmount,
            original.tradeType
        );

        // Bypass readonly and override route
        (this as any).route = newRoute;
    }
}
