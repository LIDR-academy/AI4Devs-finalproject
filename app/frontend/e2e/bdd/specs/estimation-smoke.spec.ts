import { test } from '@playwright/test'
import {
  createWorld,
  givenIOpenTheApplication,
  thenIShouldSeeEstimationSuccessFeedback,
  thenIShouldSeeReportWithCoreSections,
  whenIAddTwoUseCasesToTheSelectedProject,
  whenICreateANewProjectWithValidData,
  whenILoadTheGeneratedReport,
  whenITriggerAnEstimation,
} from '../steps'

test('Feature: estimation_smoke / Scenario: User completes project estimation and views report', async ({ page }) => {
  const world = createWorld()

  await givenIOpenTheApplication(page)
  await whenICreateANewProjectWithValidData(page, world)
  await whenIAddTwoUseCasesToTheSelectedProject(page, world)
  await whenITriggerAnEstimation(page)
  await whenILoadTheGeneratedReport(page)

  await thenIShouldSeeEstimationSuccessFeedback(page)
  await thenIShouldSeeReportWithCoreSections(page, world)
})
