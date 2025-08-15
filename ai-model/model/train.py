import argparse
import json
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, Trainer, TrainingArguments
import torch


def moral_weight(text: str) -> float:
	# Placeholder: assign higher weight if content reflects fairness keywords
	keywords = ['fair', 'inclusive', 'ethical', 'wellbeing']
	return 1.5 if any(k in text.lower() for k in keywords) else 1.0


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument('--data', required=True)
	parser.add_argument('--out', required=True)
	parser.add_argument('--model', default='gpt2')
	args = parser.parse_args()

	ds = load_dataset('json', data_files={'train': f'{args.data}/dataset.jsonl'})
	tokenizer = AutoTokenizer.from_pretrained(args.model)
	tokenizer.pad_token = tokenizer.eos_token

	def tokenize(ex):
		inputs = [f"Context: {json.dumps(ex['emotions'])} {json.dumps(ex['opinions'])} Metrics: {json.dumps(ex['metrics'])}\nQuestion: Provide ethical strategy suggestions.\nAnswer:"]
		return tokenizer(inputs, padding='max_length', truncation=True, max_length=256)

	tok = ds.map(tokenize, batched=False)
	model = AutoModelForCausalLM.from_pretrained(args.model)

	def compute_loss(model, inputs, return_outputs=False):
		labels = inputs['input_ids'].clone()
		outputs = model(**inputs, labels=labels)
		loss = outputs.loss
		# Increase weight for morally aligned samples (approximate)
		if 'text' in inputs:
			w = torch.tensor([moral_weight(t) for t in inputs['text']], device=loss.device).mean()
			loss = loss * w
		return (loss, outputs) if return_outputs else loss

	training_args = TrainingArguments(output_dir=args.out, per_device_train_batch_size=2, num_train_epochs=1, logging_steps=10, save_steps=50)
	trainer = Trainer(model=model, args=training_args, train_dataset=tok['train'], tokenizer=tokenizer, compute_loss=compute_loss)
	trainer.train()
	model.save_pretrained(args.out)
	tokenizer.save_pretrained(args.out)


if __name__ == '__main__':
	main()