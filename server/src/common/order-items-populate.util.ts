export function withOrderItemsPopulate(query: any) {
    return query
        .select('-customerId -orderNo -orderName -__v -createdAt -updatedAt -state')
        .populate({
            path: 'items',
            select: '-lot -createdAt -updatedAt -__v',
            populate: {
                path: 'orderId',
                select: 'id orderName deliveryDate',
                populate: {
                    path: 'customerId',
                    select: 'id name'
                }
            }
        });
}
