export interface PresentedChoice {
  readonly id: string;
  readonly label: string;
  readonly book?: unknown;
  readonly delivery?: 'speech' | 'action';
  readonly spokenText?: string;
}
export function spokenChoice(choice: PresentedChoice | undefined): string | null;
