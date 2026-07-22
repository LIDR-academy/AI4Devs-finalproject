import { expect, test } from '@playwright/test'
import { buildProjectData } from './fixtures/test-data'
import { addUseCase, createProject } from './utils/workflow'

test('completes the MVP estimation flow and shows report data', async ({ page }) => {
  const data = buildProjectData()

  await page.goto('/')
  await expect(page.getByTestId('psai-home-title')).toContainText('ProjectScope AI')

  await createProject(page, data.projectName, data.projectDescription)
  await addUseCase(page, data.useCaseTitle, data.useCaseDescription)
  await addUseCase(page, `${data.useCaseTitle} API`, `${data.useCaseDescription} con integracion externa.`)

  await page.getByTestId('psai-estimate-trigger-button').click()
  await expect(page.getByTestId('psai-estimate-alert')).toContainText(/estimaci[oó]n generada correctamente/i)
  await expect(page.getByTestId('psai-estimate-result')).toBeVisible()
  await expect(page.getByTestId('psai-estimate-result')).toContainText('Fases')

  await page.getByTestId('psai-report-load-button').click()

  await expect(page.getByTestId('psai-report-view')).toBeVisible()
  await expect(page.getByTestId('psai-report-view-card')).toContainText('Roadmap')
  await expect(page.getByTestId('psai-report-view-card')).toContainText('Casos de uso')
  await expect(page.getByTestId('psai-report-view-card')).toContainText('Supuestos')
  await expect(page.getByTestId('psai-report-view-card')).toContainText(data.projectName)
})
