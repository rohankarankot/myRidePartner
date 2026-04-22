const DEFAULT_FREQUENCY = 2;

export function useInterstitialAd(_frequency = DEFAULT_FREQUENCY, _customAdUnitId?: string) {
  const showAdWithCallback = (callback: () => void) => {
    callback();
  };

  return { showAdWithCallback, loaded: false };
}
