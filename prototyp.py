import pandas as pd

class AsciiCanvas:
    def __init__(self, width=50, height=50):
        self.width = width
        self.height = height
        self.canvas = [["." for _ in range(width)] for _ in range(height)]  # '.' = empty pixel

    def display(self):
        print("\nCanvas:")
        for row in self.canvas:
            print(" ".join(row))
        print()

    def set_pixel(self, x, y, color):
        if 0 <= x < self.width and 0 <= y < self.height:
            self.canvas[y][x] = color
        else:
            print("Ogiltig position.")

    def save_to_csv(self, filename="ascii_canvas.csv"):
        df = pd.DataFrame(self.canvas)
        df.to_csv(filename, index=False, header=False)
        print(f"Canvas sparad som '{filename}'.")

    def reset(self):
        self.canvas = [["." for _ in range(self.width)] for _ in range(self.height)]
        print("Canvas återställd.")


canvas = AsciiCanvas(width=50, height=50)
actions = ["rita", "visa", "spara", "återställ", "avsluta"]

print("Välkommen till prototypen!")

while True:
    print("\nAlternativ:", ", ".join(actions))
    cmd = input("Vad vill du göra? ").strip().lower()

    if cmd == "rita":
        try:
            x = int(input("X: "))
            y = int(input("Y: "))
            color = input("Färg (1 tecken, ex: @, #, *, A): ")[0]
            canvas.set_pixel(x, y, color)
        except Exception as e:
            print("Fel inmatning:", e)

    elif cmd == "visa":
        canvas.display()

    elif cmd == "spara":
        canvas.save_to_csv()

    elif cmd == "återställ":
        canvas.reset()

    elif cmd == "avsluta":
        print("Avslutar...")
        break

    else:
        print("Okänt kommando.")

