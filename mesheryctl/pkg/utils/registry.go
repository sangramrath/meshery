package utils

import (
	"io"
	"os"
	"path/filepath"
	"strings"

	meshkitRegistryUtils "github.com/meshery/meshkit/registry"
	"github.com/meshery/meshkit/utils"
)

type SystemType int

const (
	Meshery SystemType = iota
	Docs
	RemoteProvider
	rowIndex               = 1
	shouldRegisterColIndex = -1
)

func (dt SystemType) String() string {
	switch dt {
	case Meshery:
		return "meshery"

	case Docs:
		return "docs"

	case RemoteProvider:
		return "remote-provider"
	}
	return ""
}

func GetIndexForRegisterCol(cols []string, shouldRegister string) int {
	if shouldRegisterColIndex != -1 {
		return shouldRegisterColIndex
	}

	for index, col := range cols {
		if col == shouldRegister {
			return index
		}
	}
	return shouldRegisterColIndex
}

func GenerateMDXStyleDocs(model meshkitRegistryUtils.ModelCSV, components []meshkitRegistryUtils.ComponentCSV, modelPath, imgPath string) error {
	// ../layer5/src/collections/integrations ../layer5/src/collections/integrations
	modelName := utils.FormatName(model.Model)
	// create dir for model
	modelDir, _ := filepath.Abs(filepath.Join("../", modelPath, modelName))
	err := os.MkdirAll(modelDir, 0777)
	if err != nil {
		return err
	}

	// create img for model
	imgsOutputPath, _ := filepath.Abs(filepath.Join("../", imgPath))
	imgDir := filepath.Join(imgsOutputPath, modelName)
	err = os.MkdirAll(imgDir, 0777)
	if err != nil {
		return err
	}

	// create dir for color model icons
	iconsDir := filepath.Join(imgDir, "icons", "color")
	err = os.MkdirAll(iconsDir, 0777)
	if err != nil {
		return err
	}

	err = utils.WriteToFile(filepath.Join(iconsDir, modelName+"-color.svg"), model.SVGColor)
	if err != nil {
		return err
	}

	// create dir for white model icons
	iconsDir = filepath.Join(modelDir, "icons", "white")
	err = os.MkdirAll(iconsDir, 0777)
	if err != nil {
		return err
	}

	err = utils.WriteToFile(filepath.Join(iconsDir, modelName+"-white.svg"), model.SVGWhite)
	if err != nil {
		return err
	}

	// generate components metadata and create svg files
	compIconsSubDir := filepath.Join("icons", "components")
	componentMetadata, err := meshkitRegistryUtils.CreateComponentsMetadataAndCreateSVGsForMDXStyle(model, components, modelDir, compIconsSubDir)
	if err != nil {
		return err
	}

	// generate markdown file
	md := model.CreateMarkDownForMDXStyle(componentMetadata)
	err = utils.WriteToFile(filepath.Join(modelDir, "index.mdx"), md)
	if err != nil {
		return err
	}

	return nil
}

func GenerateJSStyleDocs(model meshkitRegistryUtils.ModelCSV, docsJSON string, components []meshkitRegistryUtils.ComponentCSV, relationships []meshkitRegistryUtils.RelationshipCSV, modelPath, imgPath string) (string, error) {
	// ../../meshery.io/integrations ../meshery.io/assets/images/integration
	modelName := utils.FormatName(model.Model)
	componentsCount := len(components)
	relationshipsCount := len(relationships)
	// ./../meshery.io/integrations ../meshery.io/assets/images/integration
	iconDir := filepath.Join(filepath.Join(strings.Split(imgPath, "/")[1:]...), modelName) // "../images", "integrations"

	// generate data.js file
	jsonItem := model.CreateJSONItem(iconDir)
	docsJSON += jsonItem + ","

	// create color dir for icons
	imgsOutputPath, _ := filepath.Abs(filepath.Join("../", imgPath, modelName))
	colorIconsDir := filepath.Join(imgsOutputPath, "icons", "color")
	// create svg dir
	err := os.MkdirAll(colorIconsDir, 0777)
	if err != nil {
		return "", err
	}

	// write color svg
	err = utils.WriteToFile(filepath.Join(colorIconsDir, modelName+"-color.svg"), model.SVGColor)
	if err != nil {
		return "", err
	}

	// create white dir for icons
	whiteIconsDir := filepath.Join(imgsOutputPath, "icons", "white")
	// create svg dir
	err = os.MkdirAll(whiteIconsDir, 0777)
	if err != nil {
		return "", err
	}

	// write white svg
	err = utils.WriteToFile(filepath.Join(whiteIconsDir, modelName+"-white.svg"), model.SVGWhite)
	if err != nil {
		return "", err
	}

	parts := strings.Split(modelPath, "meshery.io")
	modelCollections := filepath.Join(parts[0], "meshery.io", "collections", "_models", modelName)

	err = os.MkdirAll(modelCollections, 0777)
	if err != nil {
		return "", err
	}
	mdDir, _ := filepath.Abs(filepath.Join(modelCollections))

	_imgOutputPath := filepath.Join(imgsOutputPath, "components")
	_iconsSubDir := filepath.Join(filepath.Join(strings.Split(imgPath, "meshery.io/")[1:]...), modelName, "components")
	componentMetadata, err := meshkitRegistryUtils.CreateComponentsMetadataAndCreateSVGsForMDStyle(model, components, _imgOutputPath, _iconsSubDir)
	if err != nil {
		return "", err
	}
	relationshipMetadata, err := meshkitRegistryUtils.CreateRelationshipsMetadata(model, relationships)
	if err != nil {
		return "", err
	}

	// generate markdown file
	md := model.CreateMarkDownForMDStyle(componentMetadata, relationshipMetadata, componentsCount, relationshipsCount, "mesheryio")
	file, err := os.Create(filepath.Join(mdDir, modelName+".md"))
	if err != nil {
		return "", err
	}
	defer file.Close()

	_, err = io.WriteString(file, md)
	if err != nil {
		return "", err
	}

	return docsJSON, nil
}

func GenerateMDStyleDocs(model meshkitRegistryUtils.ModelCSV, components []meshkitRegistryUtils.ComponentCSV, relationships []meshkitRegistryUtils.RelationshipCSV, modelPath, imgPath string) error {

	modelName := utils.FormatName(model.Model)
	componentsCount := len(components)
	relationshipsCount := len(relationships)
	// dir for markdown
	modelsOutputPath, _ := filepath.Abs(filepath.Join("../", modelPath))
	mdDir := filepath.Join(modelsOutputPath) // path, "pages", "integrations"
	err := os.MkdirAll(mdDir, 0777)
	if err != nil {
		return err
	}

	// dir for icons
	imgsOutputPath, _ := filepath.Abs(filepath.Join("../", imgPath, modelName))
	iconsDir := filepath.Join(imgsOutputPath)
	err = os.MkdirAll(iconsDir, 0777)
	if err != nil {
		return err
	}

	// for color icons
	colorIconsDir := filepath.Join(iconsDir, "icons", "color")
	err = os.MkdirAll(colorIconsDir, 0777)
	if err != nil {
		return err
	}

	err = utils.WriteToFile(filepath.Join(colorIconsDir, modelName+"-color.svg"), model.SVGColor)
	if err != nil {
		return err
	}

	// for white icons
	whiteIconsDir := filepath.Join(iconsDir, "icons", "white")
	err = os.MkdirAll(whiteIconsDir, 0777)
	if err != nil {
		return err
	}

	err = utils.WriteToFile(filepath.Join(whiteIconsDir, modelName+"-white.svg"), model.SVGWhite)
	if err != nil {
		return err
	}

	// generate components metadata and create svg files
	_iconsSubDir := filepath.Join(filepath.Join(strings.Split(imgPath, "/")[1:]...), modelName, "components") // "assets", "img", "integrations"
	_imgOutputPath := filepath.Join(imgsOutputPath, "components")
	componentMetadata, err := meshkitRegistryUtils.CreateComponentsMetadataAndCreateSVGsForMDStyle(model, components, _imgOutputPath, _iconsSubDir)
	if err != nil {
		return err
	}
	relationshipMetadata, err := meshkitRegistryUtils.CreateRelationshipsMetadata(model, relationships)
	if err != nil {
		return err
	}

	// generate markdown file
	md := model.CreateMarkDownForMDStyle(componentMetadata, relationshipMetadata, componentsCount, relationshipsCount, "mesherydocs")
	file, err := os.Create(filepath.Join(mdDir, modelName+".md"))
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = io.WriteString(file, md)
	if err != nil {
		return err
	}

	return nil
}

func GenerateIcons(model meshkitRegistryUtils.ModelCSV, components []meshkitRegistryUtils.ComponentCSV, imgPath string) error {
	modelName := utils.FormatName(model.Model)

	// Dir for icons
	imgsOutputPath, _ := filepath.Abs(filepath.Join("../", imgPath, modelName))
	iconsDir := filepath.Join(imgsOutputPath)
	err := os.MkdirAll(iconsDir, 0777)
	if err != nil {
		return err
	}

	// For color icons
	colorIconsDir := filepath.Join(iconsDir, "icons", "color")
	err = os.MkdirAll(colorIconsDir, 0777)
	if err != nil {
		return err
	}

	err = utils.WriteToFile(filepath.Join(colorIconsDir, modelName+"-color.svg"), model.SVGColor)
	if err != nil {
		return err
	}

	// For white icons
	whiteIconsDir := filepath.Join(iconsDir, "icons", "white")
	err = os.MkdirAll(whiteIconsDir, 0777)
	if err != nil {
		return err
	}

	err = utils.WriteToFile(filepath.Join(whiteIconsDir, modelName+"-white.svg"), model.SVGWhite)
	if err != nil {
		return err
	}

	// Generate components metadata and create SVG files
	_iconsSubDir := filepath.Join(filepath.Join(strings.Split(imgPath, "/")[1:]...), modelName, "components")
	_imgOutputPath := filepath.Join(imgsOutputPath, "components")
	_, err = meshkitRegistryUtils.CreateComponentsMetadataAndCreateSVGsForMDStyle(model, components, _imgOutputPath, _iconsSubDir)
	if err != nil {
		return err
	}

	return nil
}
