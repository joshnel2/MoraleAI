# AI Model Infrastructure & Training

This folder contains two parts:
- Infrastructure-as-code (AWS CDK TypeScript or Terraform) to provision training/inference resources
- Python model code (Hugging Face) for preprocessing, training, and evaluation

## Infrastructure (choose one)
- `cdk/` (AWS CDK in TypeScript): SageMaker training jobs, S3 buckets (encrypted), Lambda for inference, IAM roles (least privilege)
- `terraform/` (Terraform): equivalent resources

### CDK quick start
```
cd cdk
npm install
npm run build
cdk synth
cdk deploy
```

## Python model
Scripts in `model/`:
- `preprocess.py`: merges anonymized chat data with business metrics to create training datasets
- `train.py`: fine-tunes a base transformer with custom loss emphasizing ethical alignment
- `evaluate.py`: reports perplexity and a simple ethical score

Install and run:
```
cd model
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python preprocess.py --input ./data --output ./datasets
python train.py --data ./datasets --out ./checkpoints
python evaluate.py --data ./datasets --ckpt ./checkpoints
```

Security: Always use anonymized datasets and encrypt storage. Do not export raw personal data.