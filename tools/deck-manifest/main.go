// Command deck-manifest は slides/*.md のヘッドマターから、blog に渡すデッキ一覧を JSON で吐く。
//
// 公開 URL は GitHub Pages の配置（<owner>.github.io/<repo>/<deck>/）に合わせる。
// OGP 画像のファイル名は .github/actions/build-decks/action.yml が決めているので、
// 片方を変えたらもう片方も直す。
//
// リポジトリのルートで動かす前提。
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

const slidesDir = "slides"

var required = []string{"title", "description", "date"}

type deck struct {
	Slug        string `json:"slug"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Date        string `json:"date"`
	URL         string `json:"url"`
	OGImage     string `json:"ogImage"`
}

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func run() error {
	base, err := siteBase()
	if err != nil {
		return err
	}

	paths, err := filepath.Glob(filepath.Join(slidesDir, "*.md"))
	if err != nil {
		return err
	}
	if len(paths) == 0 {
		return fmt.Errorf("%s/*.md が 1 枚も無い", slidesDir)
	}

	decks := make([]deck, 0, len(paths))
	for _, path := range paths {
		fields, err := headMatter(path)
		if err != nil {
			return err
		}

		var missing []string
		for _, key := range required {
			if fields[key] == "" {
				missing = append(missing, key)
			}
		}
		if len(missing) > 0 {
			return fmt.Errorf("%s: ヘッドマターに %s が無い", path, strings.Join(missing, ", "))
		}

		slug := strings.TrimSuffix(filepath.Base(path), ".md")
		url := fmt.Sprintf("%s/%s/", base, slug)
		decks = append(decks, deck{
			Slug:        slug,
			Title:       fields["title"],
			Description: fields["description"],
			Date:        fields["date"],
			URL:         url,
			OGImage:     url + "og-image.png",
		})
	}

	// 一覧ページと同じ「日付の新しい順」。同日は slug で決め打ちして並びを固定する
	sort.Slice(decks, func(i, j int) bool {
		if decks[i].Date != decks[j].Date {
			return decks[i].Date > decks[j].Date
		}
		return decks[i].Slug > decks[j].Slug
	})

	enc := json.NewEncoder(os.Stdout)
	enc.SetIndent("", "  ")
	enc.SetEscapeHTML(false)
	return enc.Encode(decks)
}

// headMatter はヘッドマターを map にする。ネストも配列も使っていないので 1 行 1 項目で読む。
func headMatter(path string) (map[string]string, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	text := string(raw)
	if !strings.HasPrefix(text, "---\n") {
		return nil, fmt.Errorf("%s: ヘッドマターが無い", path)
	}
	body := text[len("---\n"):]
	end := strings.Index(body, "\n---")
	if end < 0 {
		return nil, fmt.Errorf("%s: ヘッドマターが閉じていない", path)
	}

	fields := map[string]string{}
	for _, line := range strings.Split(body[:end], "\n") {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		key, value, found := strings.Cut(line, ":")
		if !found {
			continue
		}
		fields[strings.TrimSpace(key)] = unquote(strings.TrimSpace(value))
	}
	return fields, nil
}

func unquote(value string) string {
	if len(value) < 2 {
		return value
	}
	if quote := value[0]; (quote == '\'' || quote == '"') && value[len(value)-1] == quote {
		return value[1 : len(value)-1]
	}
	return value
}

var originPattern = regexp.MustCompile(`[:/]([^/:]+)/([^/]+?)(?:\.git)?$`)

// siteBase は公開サイトのルート URL。
func siteBase() (string, error) {
	owner, name, err := repo()
	if err != nil {
		return "", fmt.Errorf("公開 URL を決められない: %w", err)
	}
	return fmt.Sprintf("https://%s.github.io/%s", owner, name), nil
}

// repo は公開先の owner と repo。CI では GITHUB_REPOSITORY、手元では origin から引く。
func repo() (string, string, error) {
	if slug := os.Getenv("GITHUB_REPOSITORY"); slug != "" {
		owner, name, found := strings.Cut(slug, "/")
		if !found {
			return "", "", fmt.Errorf("GITHUB_REPOSITORY %q が <owner>/<repo> でない", slug)
		}
		return owner, name, nil
	}

	out, err := exec.Command("git", "config", "--get", "remote.origin.url").Output()
	if err != nil {
		return "", "", fmt.Errorf("GITHUB_REPOSITORY も origin も無い")
	}
	matched := originPattern.FindStringSubmatch(strings.TrimSpace(string(out)))
	if matched == nil {
		return "", "", fmt.Errorf("origin の URL から <owner>/<repo> を読めない")
	}
	return matched[1], matched[2], nil
}
