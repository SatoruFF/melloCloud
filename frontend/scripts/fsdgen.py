import click
import os

# @example  
# Define fsd structure
TEMPLATES = {
    "component": {
        "index.tsx": "export const Component = () => <div>Component</div>;",
        "styles.module.css": "",
        "test.tsx": "test('Component renders', () => {});",
        "story.tsx": "export default {};",
    },
    "feature": {
        "index.ts": "export const feature = () => {};",
        "test.ts": "test('Feature test', () => {});",
    },
}

@click.command()
@click.argument("layer", type=click.Choice(["component", "feature"]))
@click.argument("name")
@click.option("--path", default="src", help="Base path for generation")
def generate(layer, name, path):
    """Generate fsd layer or segment"""
    target_path = os.path.join(path, layer, name)

    if os.path.exists(target_path):
        click.echo("❌ Folder already exist!")
        return

    os.makedirs(target_path)

    for filename, content in TEMPLATES[layer].items():
        with open(os.path.join(target_path, filename), "w") as f:
            f.write(content)

    click.echo(f"✅ {layer.capitalize()} {name} created in {target_path}.")

if __name__ == "__main__":
    generate()