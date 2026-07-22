import { expect, Page } from '@playwright/test'
import { buildProjectData } from './support/test-data'
import { addUseCase, createProject } from './support/workflow'

type BddWorld = {
  data: ReturnType<typeof buildProjectData>
}

export const createWorld = (): BddWorld => ({
  data: buildProjectData(),
})

export const givenIOpenTheApplication = async (page: Page) => {
  await page.goto('/')
  await expect(page.getByTestId('psai-home-title')).toContainText('ProjectScope AI')
}

export const whenICreateANewProjectWithValidData = async (page: Page, world: BddWorld) => {
  await createProject(page, world.data.projectName, world.data.projectDescription)
}

export const whenIAddTwoUseCasesToTheSelectedProject = async (page: Page, world: BddWorld) => {
  await addUseCase(page, world.data.useCaseTitle, world.data.useCaseDescription)
  await addUseCase(
    page,
    `${world.data.useCaseTitle} API`,
    `${world.data.useCaseDescription} con integracion externa.`,
  )
}

export const whenICreateANewProjectWithOneUseCase = async (page: Page, world: BddWorld) => {
  await whenICreateANewProjectWithValidData(page, world)
  await addUseCase(page, world.data.useCaseTitle, world.data.useCaseDescription)
}

export const whenISetAnInvalidEstimationModelValue = async (page: Page) => {
  await page.getByLabel('Modelo').fill('x')
}

export const whenITriggerAnEstimation = async (page: Page) => {
  await page.getByTestId('psai-estimate-trigger-button').click()
}

export const whenILoadTheGeneratedReport = async (page: Page) => {
  await page.getByTestId('psai-report-load-button').click()
}

export const thenIShouldSeeEstimationSuccessFeedback = async (page: Page) => {
  await expect(page.getByTestId('psai-estimate-alert')).toContainText(/estimaci[oó]n generada correctamente/i)
  await expect(page.getByTestId('psai-estimate-result')).toBeVisible()
}

export const thenIShouldSeeReportWithCoreSections = async (page: Page, world: BddWorld) => {
  await expect(page.getByTestId('psai-report-view')).toBeVisible()
  await expect(page.getByTestId('psai-report-view-card')).toContainText('Roadmap')
  await expect(page.getByTestId('psai-report-view-card')).toContainText('Casos de uso')
  await expect(page.getByTestId('psai-report-view-card')).toContainText('Supuestos')
  await expect(page.getByTestId('psai-report-view-card')).toContainText('Riesgos')
  await expect(page.getByTestId('psai-report-view-card')).toContainText(world.data.projectName)
}

export const thenIShouldSeeEstimationValidationErrorMessage = async (page: Page) => {
  await expect(page.getByTestId('psai-estimate-alert')).toBeVisible()
  await expect(page.getByTestId('psai-estimate-alert')).toContainText(/at least 2/i)
}

export const thenIShouldSeeEstimationResultEmptyState = async (page: Page) => {
  await expect(page.getByTestId('psai-estimate-result-empty')).toBeVisible()
}

export const thenIShouldSeeNoEstimationWarningInReportView = async (page: Page) => {
  await expect(page.getByTestId('psai-report-no-estimation')).toBeVisible()
}
