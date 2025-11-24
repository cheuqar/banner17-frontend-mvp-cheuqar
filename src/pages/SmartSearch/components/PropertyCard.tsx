import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { LazyPropertyImage } from '../../../components/property/LazyPropertyImage';
import styles from '../../../components/property/PropertyCard.module.css';

interface PropertyCardProps {
    property: {
        id: string;
        address: string;
        suburb: string;
        state: string;
        postcode: string;
        price: number | null;
        bedrooms: number | null;
        bathrooms: number | null;
        car_spaces?: number | null;
        property_type: string | null;
        images?: string[];
        listing_type?: string;
    };
    onClick?: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
    const imageUrl = property.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';

    const formatPrice = (price: number | null) => {
        if (!price || price === 0) return 'Price on request';
        return `$${price.toLocaleString()}`;
    };

    return (
        <Card
            onClick={onClick}
            className={`${styles.propertyCard} fade-in-up`}
        >
            {/* Property Image - Lazy Loading with monochrome grayscale filter */}
            <Box className={styles.imageContainer}>
                <LazyPropertyImage
                    src={imageUrl}
                    alt={property.address}
                    height={200}
                    borderRadius="0px"
                    className={styles.propertyImage}
                />
            </Box>

            {/* Property Details */}
            <CardContent className={styles.propertyCardContent}>
                {/* Property Type Label - FR-015: 11px uppercase, 700 weight, #666666 */}
                {property.property_type && (
                    <Typography component="div" className={styles.propertyType}>
                        {property.property_type}
                    </Typography>
                )}

                {/* Price - FR-014: 20px text at 700 weight, black color */}
                <Typography component="div" className={styles.price}>
                    {formatPrice(property.price)}
                </Typography>

                {/* Address - FR-001 to FR-005: Typography hierarchy */}
                <Typography component="div" className={styles.address}>
                    {property.address}
                </Typography>

                <Typography component="div" className={styles.location}>
                    {property.suburb}, {property.state} {property.postcode}
                </Typography>

                {/* Property Features - FR-018: 16px icons with 13px/500 labels */}
                <Box className={styles.features}>
                    {property.bedrooms !== null && property.bedrooms !== undefined && (
                        <Box className={styles.featureItem}>
                            <BedIcon className={styles.featureIcon} />
                            <Typography component="span" className={styles.featureLabel}>
                                {property.bedrooms}
                            </Typography>
                        </Box>
                    )}

                    {property.bathrooms !== null && property.bathrooms !== undefined && (
                        <Box className={styles.featureItem}>
                            <BathtubIcon className={styles.featureIcon} />
                            <Typography component="span" className={styles.featureLabel}>
                                {property.bathrooms}
                            </Typography>
                        </Box>
                    )}

                    {property.car_spaces !== null && property.car_spaces !== undefined && (
                        <Box className={styles.featureItem}>
                            <DirectionsCarIcon className={styles.featureIcon} />
                            <Typography component="span" className={styles.featureLabel}>
                                {property.car_spaces}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default PropertyCard;
