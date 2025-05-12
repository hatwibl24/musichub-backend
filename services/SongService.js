const DatabaseOperations = require('../utils/db-operations');
const Song = require('../models/Song');
const { uploadUtils } = require('../utils/upload');

class SongService extends DatabaseOperations {
    constructor() {
        super(Song);
    }

    // Create new song with file upload
    async createSong(songData, songFile, coverFile) {
        try {
            // Upload song file to Cloudinary
            const { url: songUrl, duration } = await uploadUtils.uploadSong(songFile);
            
            // Upload cover art if provided
            let coverUrl = 'default-cover.jpg';
            if (coverFile) {
                coverUrl = await uploadUtils.uploadCoverArt(coverFile);
            }

            // Create song document
            const song = await this.create({
                ...songData,
                fileUrl: songUrl,
                duration,
                coverArt: coverUrl
            });

            // If song is part of an album, update album
            if (songData.albumId) {
                await this.model.findByIdAndUpdate(
                    songData.albumId,
                    { $push: { songs: song._id } }
                );
            }

            return song;
        } catch (error) {
            // Clean up uploaded files if database operation fails
            if (songData.fileUrl) {
                await uploadUtils.deleteFile(songData.fileUrl);
            }
            if (songData.coverArt && songData.coverArt !== 'default-cover.jpg') {
                await uploadUtils.deleteFile(songData.coverArt);
            }
            throw error;
        }
    }

    // Get songs by artist
    async getArtistSongs(artistId, options = {}) {
        return this.findWithPagination(
            { artist: artistId },
            {
                ...options,
                populate: 'artist album'
            }
        );
    }

    // Get songs by genre
    async getSongsByGenre(genre, options = {}) {
        return this.findWithPagination(
            { genre },
            {
                ...options,
                populate: 'artist album'
            }
        );
    }

    // Increment play count
    async incrementPlays(songId) {
        try {
            return await this.model.findByIdAndUpdate(
                songId,
                { $inc: { plays: 1 } },
                { new: true }
            );
        } catch (error) {
            this.handleError('incrementPlays', error);
        }
    }

    // Add/remove like
    async toggleLike(songId, userId) {
        try {
            const song = await this.findById(songId);
            const hasLiked = song.likes.includes(userId);

            const update = hasLiked
                ? { $pull: { likes: userId } }
                : { $addToSet: { likes: userId } };

            return await this.model.findByIdAndUpdate(
                songId,
                update,
                { new: true }
            );
        } catch (error) {
            this.handleError('toggleLike', error);
        }
    }

    // Add comment
    async addComment(songId, userId, text) {
        try {
            return await this.model.findByIdAndUpdate(
                songId,
                {
                    $push: {
                        comments: {
                            user: userId,
                            text,
                            createdAt: new Date()
                        }
                    }
                },
                { new: true }
            ).populate('comments.user', 'username profilePhoto');
        } catch (error) {
            this.handleError('addComment', error);
        }
    }

    // Delete song and associated files
    async deleteSong(songId) {
        try {
            const song = await this.findById(songId);
            
            // Delete files from Cloudinary
            await uploadUtils.deleteFile(song.fileUrl);
            if (song.coverArt !== 'default-cover.jpg') {
                await uploadUtils.deleteFile(song.coverArt);
            }

            // Remove song from album if it belongs to one
            if (song.album) {
                await this.model.findByIdAndUpdate(
                    song.album,
                    { $pull: { songs: songId } }
                );
            }

            // Delete song document
            return await this.delete(songId);
        } catch (error) {
            this.handleError('deleteSong', error);
        }
    }
}

module.exports = new SongService(); 