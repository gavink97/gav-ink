package types

import "time"

type Post struct {
	Id           int
	Title        string
	Tags         []string
	LastModified time.Time
	Url          string
	ImageUrl     string
	Content      string
}

type NewPostParams struct {
	Id           int
	Title        string
	Tags         []string
	LastModified time.Time
	Url          string
	ImageUrl     string
	Content      string
}

func NewPost(params NewPostParams) *Post {
	return &Post{
		Id:           params.Id,
		Title:        params.Title,
		Tags:         params.Tags,
		LastModified: params.LastModified,
		Url:          params.Url,
		ImageUrl:     params.ImageUrl,
		Content:      params.Content,
	}
}
