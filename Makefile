
ifneq (,$(wildcard ../.env))
    include ../.env
    export
endif

deploy:
	@echo "Deploying the application"
	@echo "----------------------------"
	
	@echo "Building the application..."
	@echo "----------------------------"

	@"C:\Program Files\Amazon\AWSSAMCLI\bin\sam.cmd" build --parameter-overrides DBPassword=$(DBPASSWORD) --profile $(PROFILE)

	@echo "Deploying the application..."
	@echo "----------------------------"

	@"C:\Program Files\Amazon\AWSSAMCLI\bin\sam.cmd" deploy --stack-name EbattleApiDev --s3-bucket $(BUCKET) --capabilities CAPABILITY_NAMED_IAM CAPABILITY_IAM --parameter-overrides DBPassword=$(DBPASSWORD) --profile $(PROFILE) --region $(REGION)

	@echo "Application deployed successfully"
	@echo "----------------------------"

vars:
	@echo "Printing the environment variables"
	@echo "----------------------------"
	@echo "BUCKET: $(BUCKET)"
	@echo "PROFILE: $(PROFILE)"
	@echo "REGION: $(REGION)"
	@echo "----------------------------"