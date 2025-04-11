package dbstore

import (
	"github.com/gavink97/gav-ink/internal/hash"
	"github.com/gavink97/gav-ink/internal/store"

	"gorm.io/gorm"
)

type UserStore struct {
	db           *gorm.DB
	passwordhash hash.PasswordHash
}

type NewUserStoreParams struct {
	DB           *gorm.DB
	PasswordHash hash.PasswordHash
}

func NewUserStore(params NewUserStoreParams) *UserStore {
	return &UserStore{
		db:           params.DB,
		passwordhash: params.PasswordHash,
	}
}

func (s *UserStore) CreateUser(email string) error {

	return s.db.Create(&store.User{
		Email: email,
	}).Error
}

func (s *UserStore) GetUser(email string) (*store.User, error) {

	var user store.User
	err := s.db.Where("email = ?", email).First(&user).Error

	if err != nil {
		return nil, err
	}
	return &user, err
}
