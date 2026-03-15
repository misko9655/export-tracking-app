import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Product, ProductDocument } from "./product.schema";
import { Model } from "mongoose";
import { productsData } from "./output (1)";
import { CreateProductDto } from "./dto/create-product.dto";


@Injectable()
export class ProductsService {

    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>
    ) {}

    async findAll(): Promise<Product[]> {
        return this.productModel.find().exec();
    }

    // async save() {
    //     console.log(productsData.length);

    //     productsData.forEach(product => {
    //         const newProduct: CreateProductDto = {
    //             normCode: product.normCode,
    //             productCode: product.productCode,
    //             productName: product.productName,
    //             unitOfMeasure: product.unitOfMeasure,
    //             unitsInTransportBox: Number(product.unitsInTransportBox)
    //         }

    //         const createdProduct = new this.productModel(newProduct);
    //         createdProduct.save();
    //     })
    // }
}