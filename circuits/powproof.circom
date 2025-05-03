pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/sha256/sha256.circom";

template PoW(difficulty) {
    signal input preimage[512];
    signal output dummy;

    component hasher = Sha256(512);

    for (var i = 0; i < 512; i++) {
        hasher.in[i] <== preimage[i];
    }

    for (var i = 0; i < difficulty; i++) {
        hasher.out[i] === 0;
    }

    dummy <== 1;  // Just a placeholder output to generate publicSignals
}

component main = PoW(5);
