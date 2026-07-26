import type {
  VideoAspectRatio,
  VideoDuration,
  VideoModel,
  VideoResolution,
  VideoSettingsValue as ContractVideoSettingsValue,
  VideoStudioMode,
} from "./video-settings";

export function createInitialVideoSettings(): Record<VideoStudioMode, ContractVideoSettingsValue> {
  return {
    "video-text": { model: "", aspectRatio: "16:9", duration: 5, resolution: "1080p", motion: "balanced" },
    "video-image": { model: "", aspectRatio: "16:9", duration: 5, resolution: "1080p", motion: "balanced" },
  };
}

function supportedOrFirst<T>(current: T, values: readonly T[]): T {
  return values.includes(current) ? current : (values[0] ?? current);
}

export function reconcileVideoSettings(value: ContractVideoSettingsValue, model: VideoModel): ContractVideoSettingsValue {
  const durations = model.capabilities.durations.map((item) => item.seconds) as VideoDuration[];
  return {
    ...value,
    model: model.slug,
    aspectRatio: supportedOrFirst<VideoAspectRatio>(value.aspectRatio, model.capabilities.aspect_ratios),
    duration: supportedOrFirst<VideoDuration>(value.duration, durations),
    resolution: supportedOrFirst<VideoResolution>(value.resolution, model.capabilities.resolutions),
  };
}

export function videoCreditCost(model: VideoModel | undefined, duration: VideoDuration) {
  if (!model) return undefined;
  const value = model.pricing.duration_costs[String(duration)];
  return Number.isFinite(value) ? value : undefined;
}
