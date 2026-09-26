import FlowDiagram from './FlowDiagram';
import { NAMES, STEPS, TEXT } from './pipeline-data';
import type { Locale } from '@/i18n/config';

/** The homepage engineering pipeline: six steps from raw text to a deployed model. */
export default function PipelineFlow({ locale }: { locale: Locale }) {
  return <FlowDiagram locale={locale} steps={STEPS} label={TEXT[locale].group} names={NAMES} wideCardH={164} />;
}
