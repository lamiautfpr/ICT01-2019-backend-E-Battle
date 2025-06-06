
GIT_BRANCH   := $(shell git rev-parse --abbrev-ref HEAD)
ENVIRONMENT := $(if $(filter prod,$(GIT_BRANCH)),prod,dev))

ifneq (,$(wildcard ../ebattle_environments/$(ENVIRONMENT).env))
    include ../ebattle_environments/$(ENVIRONMENT).env
    export
else
    $(error "Arquivo .env nao encontrado para o ambiente: $(ENVIRONMENT)")
endif

deploy: mail_template_update
	@echo "----------------------------------------"
	@echo "Building the application..."
	@echo "----------------------------------------"

	@"C:\Program Files\Amazon\AWSSAMCLI\bin\sam.cmd" build \
	  --parameter-overrides \
	    Environment=$(ENVIRONMENT) \
		DBPassword=$(DBPASSWORD) \
		DBUser=$(DBUSER) \
		DBName=$(DBNAME) \
		DBHost=$(DBHOST) \
		SupportEmail=$(SUPPORT_EMAIL) \
		RedirectLink=$(REDIRECT_LINK) \
	  --profile $(PROFILE)

	@echo "----------------------------------------"
	@echo "Deploying the application..."
	@echo "----------------------------------------"

	@"C:\Program Files\Amazon\AWSSAMCLI\bin\sam.cmd" deploy \
	  --stack-name $(STACK) \
	  --s3-bucket $(BUCKET) \
	  --capabilities CAPABILITY_NAMED_IAM CAPABILITY_IAM \
	  --parameter-overrides \
		Environment=$(ENVIRONMENT) \
		DBPassword=$(DBPASSWORD) \
		DBUser=$(DBUSER) \
		DBName=$(DBNAME) \
		DBHost=$(DBHOST) \
		SupportEmail=$(SUPPORT_EMAIL) \
		RedirectLink=$(REDIRECT_LINK) \
	  --profile $(PROFILE) \
	  --region $(REGION)

	@echo "----------------------------------------"
	@echo "Application deployed successfully"
	@echo "----------------------------------------"

mail_template_update:
	@echo "----------------------------------------"
	@echo "Deploying mails templates..."
	@echo "----------------------------------------"
	@aws s3 cp src/endpoints/mails/mail_templates/ s3://$(STATIC_BUCKET)/backend_assets/ --recursive --profile $(PROFILE) --region $(REGION)
	@echo "----------------------------------------"
	@echo "Mail templates deployed successfully"
	@echo "----------------------------------------"

vars:
	@echo "----------------------------------------"
	@echo "Printing the environment variables"
	@echo "----------------------------------------"
	@echo "BUCKET: $(BUCKET)"
	@echo "PROFILE: $(PROFILE)"
	@echo "REGION: $(REGION)"
	@echo "----------------------------------------"