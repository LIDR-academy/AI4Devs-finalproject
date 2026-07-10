import { expect, test } from '@playwright/test'
import { buildProjectData } from './fixtures/test-data'
import { addUseCase, createProject } from './utils/workflow'

test('completes the MVP estimation flow and shows report data', async ({ page }) => {
  const data = buildProjectData()

  await page.goto('/')
  await expect(page.getByTestId('psai-home-title')).toContainText('ProjectScope AI')

  await createProject(page, data.projectName, data.projectDescription)
  await addUseCase(page, data.useCaseTitle, data.useCaseDescription)

  await page.getByTestId('psai-estimate-trigger-button').click()
  await expect(page.getByTestId('psai-estimate-alert')).toContainText('Estimacion generada correctamente')
  await expect(page.getByTestId('psai-estimate-result')).toBeVisible()

  await page.getByRole('button', { name: 'Continuar a reporte' }).click()
  await page.getByTestId('psai-report-load-button').click()

  await expect(page.getByTestId('psai-report-view')).toBeVisible()
  await expect(page.getByTestId('psai-report-view-card')).toContainText('Roadmap')
})
