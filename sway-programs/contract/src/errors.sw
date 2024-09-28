library;

pub enum BondingCurveError {
    WrongAsset: (),
    TotalSupplyExceeded: (),
    SlippageLimitExceeded: (),
    InsufficientFunds: (),
    InvalidFundsAmount: (),
    InitializedPool: (),
    UninitializedPool: (),
}