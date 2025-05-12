const mongoose = require('mongoose');

class DatabaseOperations {
    constructor(model) {
        this.model = model;
    }

    // Create a new document
    async create(data) {
        try {
            const document = new this.model(data);
            return await document.save();
        } catch (error) {
            this.handleError('create', error);
        }
    }

    // Find document by ID
    async findById(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid ID format');
            }
            return await this.model.findById(id);
        } catch (error) {
            this.handleError('findById', error);
        }
    }

    // Find documents with pagination
    async findWithPagination(query = {}, options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                sort = { createdAt: -1 },
                populate = ''
            } = options;

            const skip = (page - 1) * limit;
            
            const [documents, total] = await Promise.all([
                this.model
                    .find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .populate(populate),
                this.model.countDocuments(query)
            ]);

            return {
                documents,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            this.handleError('findWithPagination', error);
        }
    }

    // Update document
    async update(id, data) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid ID format');
            }
            return await this.model.findByIdAndUpdate(
                id,
                { $set: data },
                { new: true, runValidators: true }
            );
        } catch (error) {
            this.handleError('update', error);
        }
    }

    // Delete document
    async delete(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid ID format');
            }
            return await this.model.findByIdAndDelete(id);
        } catch (error) {
            this.handleError('delete', error);
        }
    }

    // Search documents
    async search(searchTerm, fields = [], options = {}) {
        try {
            const searchQuery = {
                $text: { $search: searchTerm }
            };

            if (fields.length > 0) {
                searchQuery.$text.$search = fields
                    .map(field => `${searchTerm}`)
                    .join(' ');
            }

            return await this.findWithPagination(searchQuery, options);
        } catch (error) {
            this.handleError('search', error);
        }
    }

    // Handle errors
    handleError(operation, error) {
        console.error(`Error in ${operation} operation:`, error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            throw new Error(`Validation Error: ${errors.join(', ')}`);
        }
        
        if (error.code === 11000) {
            throw new Error('Duplicate key error');
        }
        
        throw error;
    }
}

module.exports = DatabaseOperations; 