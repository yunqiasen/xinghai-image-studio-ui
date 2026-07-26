export type VideoStudioMode = "video-text" | "video-image";
export type VideoAspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
export type VideoDuration = 5 | 10 | 18;
export type VideoResolution = "480p" | "720p" | "1080p";
export type VideoMotion = "gentle" | "balanced" | "dynamic";
export type VideoTaskStatus = "queued" | "submitting" | "in_progress" | "succeeded" | "failed";

export type VideoDurationCapability = {
  seconds: VideoDuration;
  num_frames: number;
  frame_rate: number;
};

export type VideoCapabilities = {
  input_modes: Array<"text" | "image" | "keyframes">;
  output_modes: string[];
  async: boolean;
  resolutions: VideoResolution[];
  aspect_ratios: VideoAspectRatio[];
  durations: VideoDurationCapability[];
  supports_negative_prompt?: boolean;
};

export type VideoModel = {
  id: string;
  slug: string;
  name: string;
  type: "video";
  description?: string;
  runtimeReady: boolean;
  capabilities: VideoCapabilities;
  pricing: {
    unit: "credits";
    duration_costs: Record<string, number>;
  };
};

export type VideoTask = {
  id: string;
  model: string;
  mode: "text_to_video" | "image_to_video";
  prompt: string;
  optimizedPrompt: string;
  aspectRatio: VideoAspectRatio;
  resolution: VideoResolution;
  requestedSeconds: VideoDuration;
  seconds: number;
  numFrames: number;
  frameRate: number;
  motion: VideoMotion;
  creditCost: number;
  status: VideoTaskStatus;
  progress: number;
  upstreamTaskId?: string;
  upstreamVideoId?: string;
  url?: string;
  size?: string;
  errorCode?: string;
  error?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  updatedAt: string;
};

export type CreateVideoTaskInput = {
  model: string;
  prompt: string;
  optimizedPrompt?: string;
  sourceImage?: string;
  aspectRatio: VideoAspectRatio;
  resolution: VideoResolution;
  duration: VideoDuration;
  motion: VideoMotion;
};
