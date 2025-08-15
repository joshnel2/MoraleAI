import argparse
import os
import json
from transformers import AutoTokenizer, AutoModelForCausalLM, Trainer, TrainingArguments
from datasets import load_dataset

def main():
	parser = argparse.ArgumentParser()
	parser.add_argument('--model_name', default=os.environ.get('MODEL_NAME', 'gpt2'))
	parser.add_argument('--train', default=os.environ.get('SM_CHANNEL_TRAIN', '/opt/ml/input/data/training'))
	parser.add_argument('--output', default=os.environ.get('SM_MODEL_DIR', '/opt/ml/model'))
	args = parser.parse_args()

	ds = load_dataset('json', data_files={'train': os.path.join(args.train, 'train.jsonl')})
	tokenizer = AutoTokenizer.from_pretrained(args.model_name)
	tokenizer.pad_token = tokenizer.eos_token
	def tok(ex):
		text = json.dumps(ex)
		return tokenizer([text], padding='max_length', truncation=True, max_length=256)
	tok_ds = ds.map(tok, batched=False)
	model = AutoModelForCausalLM.from_pretrained(args.model_name)
	training_args = TrainingArguments(output_dir=args.output, per_device_train_batch_size=2, num_train_epochs=1)
	trainer = Trainer(model=model, args=training_args, train_dataset=tok_ds['train'], tokenizer=tokenizer)
	trainer.train()
	model.save_pretrained(args.output)
	tokenizer.save_pretrained(args.output)

if __name__ == '__main__':
	main()