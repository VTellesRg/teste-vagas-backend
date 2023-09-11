import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Packs } from "../models/Packs";
import fs from "fs";
import csvParser from "csv-parser";

export const upload = async (req: Request, res: Response) => {
	const { file } = req;

	if (file === undefined) {
		return res.status(400).json({
			message: 'File not found',
		});
	}

	if (file.mimetype !== 'text/csv') {
		return res.status(400).json({
			message: 'file csv not found',
		});
	}

	const resp = await handleFile(file as Express.Multer.File);

	const formatedResp = await getProducts(resp);

	return res.json(formatedResp);
}

export const update = async (req: Request, res: Response) => {
	const obj = Object.keys(req.body)[0];
	const json = await JSON.parse(obj);

	for (let i = 0; i < json.length; i++) {
		const product = await Product.update({
			sales_price: json[i].new_price,
		}, {
			where: {
				code: json[i].code,
			}
		});

		let percent = (json[i].new_price / json[i].sales_price);

		const pack = await Packs.findAll({
			where: {
				pack_id: json[i].code,
			}
		});
		for (let j = 0; j < pack.length; j++) {
			const product = await Product.findOne({
				where: {
					code: pack[j].dataValues.product_id,
				}
			});

			await product?.update({
				sales_price: product.dataValues.sales_price * percent,
				
			},
				{
					where: {
						code: product?.dataValues.code,
					}
				}
			);
			product?.save();
		}
	}
	
	return res.json(obj);
}

export const createProduct = async (req: Request, res: Response) => {
	let { code, name, cost_price, sales_price } = req.body;
	let newProduct = await Product.create({
		code,
		name,
		cost_price,
		sales_price,
	});
	res.json(newProduct);
}

interface fileUpload {
	product_code: number;
	new_price: number;
}

function handleFile(file: Express.Multer.File): Promise<fileUpload[]> {
	return new Promise((resolve, reject) => {

		const stream = fs.createReadStream(file.path);

		const parseFile = csvParser();

		stream.pipe(parseFile);

		const products: fileUpload[] = [];

		parseFile.on('data', async (line) => {
			const { product_code, new_price } = line;
			products.push({
				product_code,
				new_price,
			})
		})
			.on('end', () => {
				resolve(products);
			}).on('error', (err) => {
				reject(err);
			});
	});
}

async function getProducts(data: fileUpload[]) {
	let productsList: any[] = []

	for (let i = 0; i < data.length; i++) {
		const product = await Product.findOne({
			where: {
				code: data[i].product_code,
			}
		});
		const new_price = parseFloat(data[i].new_price.toString());
		const cost_price = parseFloat(product?.dataValues.cost_price.toString());
		const sales_price = parseFloat(product?.dataValues.sales_price.toString());

		if (!product?.dataValues) {
			productsList.push({
				code: data[i].product_code,
				name: '-',
				cost_price: '-',
				sales_price: '-',
				new_price: data[i].new_price,
				valid_from: 'Produto não encontrado',
			});
		} else {
			if (product && new_price < cost_price) {
				productsList.push({
					code: product.dataValues.code,
					name: product.dataValues.name,
					cost_price: product.dataValues.cost_price,
					sales_price: product.dataValues.sales_price,
					new_price: data[i].new_price,
					valid_from: 'preco de venda menor que o de custo',
				});
			} else {
				if (product && new_price > (sales_price * 1.1) || product && new_price < (sales_price * 0.9)) {
					productsList.push({
						code: product.dataValues.code,
						name: product.dataValues.name,
						cost_price: product.dataValues.cost_price,
						sales_price: product.dataValues.sales_price,
						new_price: data[i].new_price,
						valid_from: 'preco de venda fora da margem de 10%',
					});
				} else {
					if (product?.dataValues) {
						productsList.push({
							code: product.dataValues.code,
							name: product.dataValues.name,
							cost_price: product.dataValues.cost_price,
							sales_price: product.dataValues.sales_price,
							new_price: data[i].new_price,
							valid_from: 'OK',
						});
					}
				}
			}
		}
	};

	return productsList;
}