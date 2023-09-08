import { Request, Response } from "express";
import { Product, ProductInstance } from "../models/Product";
import fs from "fs";
import csvParser from "csv-parser";

export const upload = async (req: Request, res: Response) => {
	const { file } = req;
	const productsList: (ProductInstance | null)[] = [];
	const resp = await handleProducts(file as Express.Multer.File);
	const result = await getProducts(resp);
	// console.log(result);
	
	const validProducts = validateProducts(result);
		// console.log(produto);
		
		
	return res.json(validProducts);
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

interface fileUpload {
	product_code: number;
	new_price: number;
}

function handleProducts(file: Express.Multer.File): Promise<fileUpload[]> {
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

async function getProducts (array: any[]) {
	const productList = [];

	for(let i= 0; i < array.length; i++) {
		const produto = await Product.findOne({
			where: {
				code: array[i].product_code,
			}
		});
		productList.push({...produto?.dataValues, 'new_price': array[i].new_price});
	};
	return productList;
}

function validateProducts(productList: any[]) {
	const validProducts = [];
	
	for(let i = 0; i < productList.length; i++) {
	if(productList[i].code == undefined || productList[i].code == null) {
		validProducts.push({
			'code': 'Código inválido',
			'name': '-',
			'cost_price': '-',
			'sales_price': '-',
			'valid_from': 'Código inválido'
		});
	
	} else {
		if(productList[i].new_price > productList[i].cost_price) {
			if(productList[i].new_price >= productList[i].sales_price*0.9 && productList[i].new_price <= productList[i].sales_price*1.1) {
				validProducts.push({
					'code': productList[i].code,
					'name': productList[i].name,
					'cost_price': productList[i].cost_price,
					'sales_price': productList[i].sales_price,
					'valid_from': 'OK'
				});
				
			} else {
				validProducts.push({
					'code': productList[i].code,
					'name': productList[i].name,
					'cost_price': productList[i].cost_price,
					'sales_price': productList[i].sales_price,
					'valid_from': 'Preço inválido, fora da margem de 10%'
				}); 
				break;
			}
		} else {
			validProducts.push({
				'code': productList[i].code,
				'name': productList[i].name,
				'cost_price': productList[i].cost_price,
				'sales_price': productList[i].sales_price,
				'valid_from': 'Preço inválido, menor que o custo'
			});
		}
	}
	
	}
	
	return  validProducts;

}