import { Request, Response } from "express";
import { Product } from "../models/Product";
import fs from "fs";

export const upload = (req: Request, res: Response) => {
	console.log(req.file);
	if(req.file === undefined) return res.status(400).json({});
	const stream = fs.createReadStream(req.file?.path);

	return res.json({});
}

export const update = (req: Request, res: Response) => {
	return res.json({});
}

export const createProduct = async (req: Request, res: Response) => {
	let { code, name, cost_price, sales_price } = req.body;
	let newProfuct = await Product.create({
		code,
		name,
		cost_price,
		sales_price,
	});
	res.json(newProfuct);
}