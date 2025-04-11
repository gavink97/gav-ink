package components

import (
	"fmt"
)

func Image(str string) string {
	return fmt.Sprintf("/public/images/%s", str)
}
