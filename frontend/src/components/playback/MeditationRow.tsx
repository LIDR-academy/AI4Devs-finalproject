/**
 * MeditationRow Component
 * 
 * Displays a single meditation row with:
 * - Status indicator (colored dot/badge)
 * - Title
 * - Media type (Audio/Video)
 * - Creation date
 * - Play button (disabled if state !== COMPLETED)
 */

import React from "react";
import StateLabel, { ProcessingState } from "./StateLabel";

export interface MeditationRowProps {
  id: string;
  title: string;
  state: ProcessingState;
  stateLabel: string;
  createdAt: string | Date; // ISO 8601 string or Date object
  mediaUrls?: {
    audioUrl?: string | null;
    videoUrl?: string | null;
    subtitlesUrl?: string | null;  
  } | null;
  onPlay: (meditationId: string) => void;
  className?: string;
}

/**
 * Formats ISO 8601 timestamp or Date to user-friendly date string.
 * @example "2026-02-16T10:30:00Z"  "16 Feb 2026"
 */
const formatDate = (input: string | Date): string => {
  try {
    const date = typeof input === "string" ? new Date(input) : input;
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  } catch {
    return String(input); // Fallback to string representation if parsing fails
  }
};

/**
 * MeditationRow Component
 * 
 * Renders a table row for a single meditation.
 */
export const MeditationRow: React.FC<MeditationRowProps> = ({
  id,
  title,
  state,
  stateLabel,
  createdAt,
  mediaUrls,
  onPlay,
  className = ""
}) => {
  const isPlayable = state === "COMPLETED";
  const formattedDate = formatDate(createdAt);

  const handlePlayClick = () => {
    if (isPlayable) {
      onPlay(id);
    }
  };

  // Determine media type icons
  const hasVideo = !!mediaUrls?.videoUrl;
  const hasAudio = !!mediaUrls?.audioUrl;

  return (
    <tr 
      className={`meditation-row ${className} ${!isPlayable ? "meditation-row--disabled" : ""}`}
      data-testid={`meditation-row-${id}`}
      onClick={handlePlayClick}
    >
      {/* Column: Status */}
      <td className="meditation-row__status">
        <StateLabel state={state} label={stateLabel} />
      </td>

      {/* Column: Title */}
      <td className="meditation-row__title">
        <div className="meditation-row__title-text">{title}</div>
      </td>

      {/* Column: Media Type */}
      <td className="meditation-row__media-type">
        {hasVideo ? "  Video" : hasAudio ? "  Audio" : ""}
      </td>

      {/* Column: Created At */}
      <td className="meditation-row__date">
        {formattedDate}
      </td>

      {/* Column: Actions */}
      <td className="meditation-row__actions">
        <button 
          className={`btn btn--sm ${isPlayable ? "btn--primary" : "btn--secondary"}`}
          disabled={!isPlayable}
          onClick={(e) => {
            e.stopPropagation(); // Avoid double click with row
            if (isPlayable) {
              onPlay(id);
            }
          }}
          title={isPlayable ? "Play" : "Not available yet"}
        >
          {isPlayable ? "  Play" : "  Pending..."}
        </button>
      </td>
    </tr>
  );
};

export default MeditationRow;