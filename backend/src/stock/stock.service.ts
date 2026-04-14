import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockProduct, StockMovement, StockMovementType } from '../database/entities/stock.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockProduct)
    private productsRepo: Repository<StockProduct>,
    @InjectRepository(StockMovement)
    private movementsRepo: Repository<StockMovement>,
  ) {}

  async createProduct(clinicId: string, data: Partial<StockProduct>): Promise<StockProduct> {
    const product = this.productsRepo.create({ ...data, clinicId });
    return this.productsRepo.save(product);
  }

  async findAllProducts(clinicId: string): Promise<StockProduct[]> {
    return this.productsRepo.find({
      where: { clinicId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getLowStock(clinicId: string): Promise<StockProduct[]> {
    return this.productsRepo
      .createQueryBuilder('p')
      .where('p.clinic_id = :clinicId', { clinicId })
      .andWhere('p.is_active = true')
      .andWhere('p.current_quantity <= p.min_quantity')
      .getMany();
  }

  async findOneProduct(clinicId: string, id: string): Promise<StockProduct> {
    const product = await this.productsRepo.findOne({ where: { id, clinicId } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async addMovement(
    clinicId: string,
    productId: string,
    type: StockMovementType,
    quantity: number,
    data: Partial<StockMovement> = {},
  ): Promise<StockMovement> {
    const product = await this.findOneProduct(clinicId, productId);

    if (type === StockMovementType.EXIT && product.currentQuantity < quantity) {
      throw new BadRequestException(
        `Estoque insuficiente. Disponível: ${product.currentQuantity}`,
      );
    }

    const quantityBefore = Number(product.currentQuantity);
    const quantityAfter =
      type === StockMovementType.ENTRY
        ? quantityBefore + quantity
        : quantityBefore - quantity;

    // Registrar movimentação
    const movement = this.movementsRepo.create({
      clinicId,
      productId,
      type,
      quantity,
      quantityBefore,
      quantityAfter,
      ...data,
    });
    await this.movementsRepo.save(movement);

    // Atualizar estoque
    product.currentQuantity = quantityAfter;
    await this.productsRepo.save(product);

    return movement;
  }

  async getMovements(clinicId: string, productId: string): Promise<StockMovement[]> {
    return this.movementsRepo.find({
      where: { clinicId, productId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async updateProduct(clinicId: string, id: string, data: Partial<StockProduct>): Promise<StockProduct> {
    await this.findOneProduct(clinicId, id);
    await this.productsRepo.update({ id, clinicId }, data);
    return this.findOneProduct(clinicId, id);
  }
}
