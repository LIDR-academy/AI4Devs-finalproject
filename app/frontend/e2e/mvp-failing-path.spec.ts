import { expect, test } from '@playwright/test'
import { buildProjectData } from './fixtures/test-data'
import { addUseCase, createProject } from './utils/workflow'

test('shows validation error when estimation model is invalid', async ({ page }) => {
  const data = buildProjectData()

  await page.goto('/')

  await createProject(page, data.projectName, data.projectDescription)
  await addUseCase(page, data.useCaseTitle, data.useCaseDescription)

  await page.getByLabel('Modelo').fill('x')
  await page.getByTestId('psai-estimate-trigger-button').click()

  await expect(page.getByTestId('psai-estimate-alert')).toBeVisible()
  await expect(page.getByTestId('psai-estimate-alert')).toContainText(/at least 2/i)

  await expect(page.getByTestId('psai-estimate-result-empty')).toBeVisible()
})
