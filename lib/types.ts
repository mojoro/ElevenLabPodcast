export type HostId = "hostA" | "hostB";

export interface EpisodeHost {
  id: HostId;
  name: string;
  role: string;
}

export interface EpisodeDialogueLine {
  speaker: HostId;
  text: string;
}

export interface PodcastEpisode {
  title: string;
  hook: string;
  summary: string;
  hosts: EpisodeHost[];
  dialogue: EpisodeDialogueLine[];
}

export interface EpisodeAudio {
  base64: string;
  mimeType: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  previewUrl: string | null;
  category: string | null;
}

export interface GeneratePodcastResponse {
  source: string;
  sourceType: "topic" | "url";
  contextPreview: string;
  contextLength: number;
  episode: PodcastEpisode & {
    estimatedCharacters: number;
    usageWarning: string | null;
  };
  audio: EpisodeAudio;
}
