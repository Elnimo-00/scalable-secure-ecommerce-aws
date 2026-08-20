# Deploy the stacks in dependency order. Requires the AWS CLI and credentials.
# Each stack imports the previous one's exports, so order matters.

PROJECT ?= enpm818n-grp21
REGION  ?= us-east-1
DOMAIN  ?= enpm818n-grp21.online

STACKS = 1-network 2-security 3-data 4-edge 5-compute 6-observability

.PHONY: lint deploy delete $(STACKS)

lint:
	cfn-lint infra/*.yaml

deploy: $(STACKS)

$(STACKS):
	aws cloudformation deploy \
	  --region $(REGION) \
	  --stack-name $(PROJECT)-$@ \
	  --template-file infra/$@.yaml \
	  --capabilities CAPABILITY_NAMED_IAM \
	  --parameter-overrides ProjectName=$(PROJECT) DomainName=$(DOMAIN)

# Delete in reverse order.
delete:
	for s in 6-observability 5-compute 4-edge 3-data 2-security 1-network; do \
	  aws cloudformation delete-stack --region $(REGION) --stack-name $(PROJECT)-$$s; \
	  aws cloudformation wait stack-delete-complete --region $(REGION) --stack-name $(PROJECT)-$$s; \
	done
