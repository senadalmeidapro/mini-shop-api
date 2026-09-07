import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Review } from '../../reviews/entities/review.entity';

export async function seedReviews(ds: DataSource): Promise<Review[]> {
  const users = await ds.getRepository(User).find();
  const products = await ds.getRepository(Product).find();

  const repo = ds.getRepository(Review);

  const reviewers = users.filter((user) => user.email !== 'admin@minishop.com');

  const reviews = repo.create(
    reviewers.map((user, index) => ({
      userId: user.id,
      productId: products[index % products.length]?.id ?? '',
      rating: 3 + (index % 3),
      comment:
        index % 2 === 0
          ? 'Super produit, bonne qualité livraison rapide.'
          : "Bon prix, J'en voudrais encore.",
    })),
  );

  return repo.save(reviews);
}
