.PHONY: help dev deploy destroy app-deploy

help:
	@echo "Available targets:"
	@echo "  make dev         - run the local dev environment (./dev.sh)"
	@echo "  make deploy      - terraform apply the AWS prod infra (./prod.sh deploy)"
	@echo "  make destroy     - terraform destroy the AWS prod infra (./prod.sh destroy)"
	@echo "  make app-deploy  - build+deploy the app containers to the running EC2 box (./prod.sh app-deploy)"

dev:
	./dev.sh

deploy:
	./prod.sh deploy

destroy:
	./prod.sh destroy

app-deploy:
	./prod.sh app-deploy
