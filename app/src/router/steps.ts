/** The screens in the order the player walks through them. */
export const STEPS = ['title', 'trainer', 'partner', 'enemy', 'stage', 'battle', 'result'] as const

export type StepName = (typeof STEPS)[number]

export const STEP_PATHS: Record<StepName, string> = {
  title: '/',
  trainer: '/trainer',
  partner: '/partner',
  enemy: '/enemy',
  stage: '/stage',
  battle: '/battle',
  result: '/result',
}

export const STEP_TITLES: Record<StepName, string> = {
  title: 'Pocket Monsters',
  trainer: 'Choose your trainer',
  partner: 'Select your partner',
  enemy: 'Select an enemy',
  stage: 'Select your stage',
  battle: 'Battle',
  result: 'Result',
}

export function isStepName(name: unknown): name is StepName {
  return typeof name === 'string' && (STEPS as readonly string[]).includes(name)
}

/** The step before this one, for the Back button. Null for the title and the screens without one. */
export function previousStep(step: StepName): StepName | null {
  const index = STEPS.indexOf(step)
  return index > 0 ? (STEPS[index - 1] ?? null) : null
}
