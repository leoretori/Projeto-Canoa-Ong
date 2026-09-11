.PHONY: install test test-cov lint build deploy delete web dev-server clean

install:
	pip install -r backend/requirements.txt pytest moto
	npm --prefix frontend install

test:
	pytest tests/ -v

test-cov:
	pytest tests/ -v --cov=backend --cov-report=term-missing

lint:
	sam validate --lint
	npm --prefix frontend run lint

build:
	sam build

deploy:
	sam deploy --guided

delete:
	sam delete

web:
	npm --prefix frontend run web

dev-server:
	python backend/dev_server.py

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	rm -rf .aws-sam .pytest_cache .coverage htmlcov
