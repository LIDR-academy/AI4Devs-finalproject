import { test } from '@playwright/test'
import {
  createWorld,
  givenIOpenTheApplication,
  thenIShouldSeeEstimationResultEmptyState,
  thenIShouldSeeEstimationValidationErrorMessage,
  thenIShouldSeeNoEstimationWarningInReportView,
  whenICreateANewProjectWithOneUseCase,
  whenILoadTheGeneratedReport,
  whenISetAnInvalidEstimationModelValue,
  whenITriggerAnEstimation,
} from '../steps'

test('Feature: estimation_regression / Scenario: Invalid model shows estimation validation error', async ({ page }) => {
  const world = createWorld()

  await givenIOpenTheApplication(page)
  await whenICreateANewProjectWithOneUseCase(page, world)
  await whenISetAnInvalidEstimationModelValue(page)
  await whenITriggerAnEstimation(page)

  await thenIShouldSeeEstimationValidationErrorMessage(page)
  await thenIShouldSeeEstimationResultEmptyState(page)
})

test('Feature: estimation_regression / Scenario: Loading report before estimation shows no-estimation warning', async ({ page }) => {
  const world = createWorld()

  await givenIOpenTheApplication(page)
  await whenICreateANewProjectWithOneUseCase(page, world)
  await whenILoadTheGeneratedReport(page)

  await thenIShouldSeeNoEstimationWarningInReportView(page)
})
