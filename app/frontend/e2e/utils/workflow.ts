import { expect, Page } from '@playwright/test'

export const createProject = async (page: Page, projectName: string, projectDescription: string) => {
  await page.getByTestId('psai-project-name-input').fill(projectName)
  await page.getByTestId('psai-project-description-input').fill(projectDescription)
  await page.getByTestId('psai-project-submit-button').click()

  await expect(page.getByTestId('psai-project-form-alert')).toContainText('Proyecto creado correctamente.')

  await page.getByRole('button', { name: 'Continuar a casos de uso' }).click()
}

export const addUseCase = async (page: Page, title: string, description: string) => {
  await page.getByTestId('psai-use-case-title-input').fill(title)
  await page.getByTestId('psai-use-case-description-input').fill(description)
  await page.getByTestId('psai-use-case-submit-button').click()

  await expect(page.getByTestId('psai-use-case-form-alert')).toContainText('Caso de uso agregado correctamente.')
  await page.getByRole('button', { name: 'Continuar a estimacion' }).click()
}
