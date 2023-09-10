import { Request, Response } from "express";
import { Product, ProductInstance } from "../models/Product";
import fs from "fs";
import csvParser from "csv-parser";
import { Packs, PacksInstance } from "../models/Packs";

export const upload = async (req: Request, res: Response) => {
	const { file } = req;
	if (file === undefined) {
		return res.status(400).json({
			 error: 'Arquivo não enviado' });
	}
	if (file.mimetype !== 'text/csv') {
		return res.status(400).json({
			error: 'Arquivo enviado não é do formato CSV' });
	}

	// const productsList: (ProductInstance | null)[] = [];
	const resp: any[]= await handleFile(file as Express.Multer.File);
	let validProducts: any[] = [];
	let validPacks: any[] = [];
	if (resp[0].length >= 4) {
		/*
			if(product_code[].lenght >= 4){
				é um pack, então:
				1. pegar o id do pack
				2. verifica se existe o pack (se sim, pega o qty, se nao, retorna erro 1 da funçao de validacao)
				3. dividir o new_price (nessa situação new_price deve ser para um pack) pelo qty
				4. salvar como new_price/sales_price do produto
				5. enviar o item para a validação
				6. retornar o "erro equivalente" ou "ok" da alteração
				
			}
		*/
		const packsResult = await getPacks(resp);
		console.log(packsResult);
		// validPacks = validateProducts(packsResult);
		// return res.json(validPacks);
	}
	else {
	const productResult = await getProducts(resp);
	// const packsList: (PacksInstance | null)[] = [];
	// console.log(productResult);
	validProducts = validateProducts(productResult);
	
	return res.json(validProducts);
	}
		// console.log(produto);	
}
//função para enviar a atualização ao BD
export const update = (req: Request, res: Response) => {
	const jsonData = req.body;
	const key = Object.keys(jsonData)[0];
	try {
		let obj = JSON.parse(key);
		console.log(obj);
	} catch (error) {
		;
	}
	// const obj = JSON.parse(json as any);
	const data: any[] = [];
	// console.log(obj);
	
	
	for (let i = 0; i < data.length; i++) {
		console.log(data[i]);
		
		// if(data[i]) {
		// 	console.log('entrou');
			
		// 	Product.update({
		// 		sales_price: data[i].new_price,
		// 	}, {
		// 		where: {
		// 			code: data[i].code,
		// 		}
		// 	});
		// 	const percent = ((data[i].new_price/data[i].sales_price));
		// 	console.log(percent);
		// }
	}
	return res.json({});
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

async function getProducts (data: any[]) {
	let productList: any[] = [];

	for(let i= 0; i < data.length; i++) {
		const produto = await Product.findOne({
			where: {
				code: data[i].product_code,
			}
		});
		productList.push({...produto?.dataValues,
			 'new_price': data[i].new_price});
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
			'new_price': '-',
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
					'new_price': productList[i].new_price,
					'valid_from': 'OK'
				});
				
			} else {
				validProducts.push({
					'code': productList[i].code,
					'name': productList[i].name,
					'cost_price': productList[i].cost_price,
					'sales_price': productList[i].sales_price,
					'new_price': productList[i].new_price,
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
				'new_price': productList[i].new_price,
				'valid_from': 'Preço inválido, menor que o custo'
			});
		}
	}
	
	}
	
	return  validProducts;

}

async function getPacks (array: any[]) {

	const packList = [];

	for(let i= 0; i < array.length; i++) {
		const pack = await Packs.findOne({
			where: {
				id: array[i].id,
			}
		});
		packList.push({...pack?.dataValues});
	};
	return packList;
} 