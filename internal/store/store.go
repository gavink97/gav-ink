package store

type User struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Email string `json:"email"`
}

type UserStore interface {
	CreateUser(email string) error
	GetUser(email string) (*User, error)
}
