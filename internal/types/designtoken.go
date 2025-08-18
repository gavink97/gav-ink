package types

type Value struct {
	Value string `json:"value"`
}

type ColorProps struct {
	Primary  *Value `json:"primary,omitempty"`
	Accent   *Value `json:"accent,omitempty"`
	Active   *Value `json:"active,omitempty"`
	Inactive *Value `json:"inactive,omitempty"`
	Mistake  *Value `json:"mistake,omitempty"`
}

type TextProps struct {
	Size       Value `json:"size"`
	LineHeight Value `json:"line-height"`
}

type Duration struct {
	Ms  Value `json:"ms"`
	Sec Value `json:"sec"`
}

type DesignToken struct {
	Color struct {
		Background ColorProps `json:"background"`
		UI         ColorProps `json:"ui"`
		CTA        ColorProps `json:"cta"`
		Text       ColorProps `json:"text"`
	} `json:"color"`
	Font struct {
		Family struct {
			Body  Value `json:"body"`
			Title Value `json:"title"`
			UI    Value `json:"ui"`
		} `json:"family"`
		Weight struct{} `json:"weight"`
	} `json:"font"`
	TextSize struct {
		Sm  TextProps `json:"sm"`
		Md  TextProps `json:"md"`
		Lg  TextProps `json:"lg"`
		Xl  TextProps `json:"xl"`
		X2l Value     `json:"2xl"`
		X3l Value     `json:"3xl"`
		X4l Value     `json:"4xl"`
		X5l Value     `json:"5xl"`
		X6l Value     `json:"6xl"`
		X7l Value     `json:"7xl"`
		X8l Value     `json:"8xl"`
		X9l Value     `json:"9xl"`
	} `json:"text-size"`
	Viewport struct {
		Sm  Value `json:"sm"`
		Md  Value `json:"md"`
		Lg  Value `json:"lg"`
		Xl  Value `json:"xl"`
		X2l Value `json:"2xl"`
	} `json:"viewport"`
	Animation struct {
		Duration struct {
			Sm Duration `json:"sm"`
			Md Duration `json:"md"`
			Lg Duration `json:"lg"`
		} `json:"duration"`
	} `json:"animation"`
}
