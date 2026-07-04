## Prompt 1: Specs from refined ticket
/speckit-specify docs/tickets/TKT-004-expiration-confidence-flow.md

## Prompt 2: Plan
/speckit-plan (with spec.md as context)

## Prompt 3: Tasks
/speckit-tasks (with plan.md as context)

## Prompt 4: Implement
/speckit-implement (with tasks.md as context)

## Fix after manual review
I've found this error during the deployment (make deploy):
~~~text
aws_db_instance.prod: Creation complete after 6m49s [id=db-ZWHF5DKUAKIJECP3W3TUWLHWYU]
╷
│ Error: creating CloudWatch Logs Log Group (/realsavefooding/prod): operation error CloudWatch Logs: CreateLogGroup, https response error StatusCode: 400, RequestID: 93932c38-eecc-44e6-9147-51e1a8f28f58, api error AccessDeniedException: User: arn:aws:iam::202982075698:user/realsavefooding-deploy is not authorized to perform: logs:CreateLogGroup on resource: arn:aws:logs:eu-west-1:202982075698:log-group:/realsavefooding/prod:log-stream: because no identity-based policy allows the logs:CreateLogGroup action
│ 
│   with aws_cloudwatch_log_group.app,
│   on main.tf line 60, in resource "aws_cloudwatch_log_group" "app":
│   60: resource "aws_cloudwatch_log_group" "app" {
│ 
╵
╷
│ Error: creating CloudWatch Metric Alarm (RealSaveFooding-error-rate-prod): operation error CloudWatch: PutMetricAlarm, https response error StatusCode: 403, RequestID: ff6ae5f8-6d2f-4d65-be52-3a90f34b3693, api error AccessDenied: User: arn:aws:iam::202982075698:user/realsavefooding-deploy is not authorized to perform: cloudwatch:PutMetricAlarm on resource: arn:aws:cloudwatch:eu-west-1:202982075698:alarm:RealSaveFooding-error-rate-prod because no identity-based policy allows the cloudwatch:PutMetricAlarm action
│ 
│   with aws_cloudwatch_metric_alarm.error_rate,
│   on main.tf line 414, in resource "aws_cloudwatch_metric_alarm" "error_rate":
│  414: resource "aws_cloudwatch_metric_alarm" "error_rate" {
│ 
╵
╷
│ Error: creating CloudWatch Metric Alarm (RealSaveFooding-p95-latency-prod): operation error CloudWatch: PutMetricAlarm, https response error StatusCode: 403, RequestID: bee2c885-7991-4f0f-968c-c6a7aae5bdf5, api error AccessDenied: User: arn:aws:iam::202982075698:user/realsavefooding-deploy is not authorized to perform: cloudwatch:PutMetricAlarm on resource: arn:aws:cloudwatch:eu-west-1:202982075698:alarm:RealSaveFooding-p95-latency-prod because no identity-based policy allows the cloudwatch:PutMetricAlarm action
│ 
│   with aws_cloudwatch_metric_alarm.origin_latency_p95,
│   on main.tf line 438, in resource "aws_cloudwatch_metric_alarm" "origin_latency_p95":
│  438: resource "aws_cloudwatch_metric_alarm" "origin_latency_p95" {
│ 
╵
make: *** [deploy] Error 1
~~~

Help me to fix the error