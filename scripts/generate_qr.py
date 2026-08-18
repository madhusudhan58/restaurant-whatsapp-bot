import os

import qrcode


BASE_URL = os.getenv(
    "MENU_BASE_URL",
    "http://localhost:8080"
)


QR_DIRECTORY = "frontend/qr-codes"


NUMBER_OF_TABLES = 20


def generate_qr_codes():

    os.makedirs(
        QR_DIRECTORY,
        exist_ok=True
    )


    for table_number in range(
        1,
        NUMBER_OF_TABLES + 1
    ):

        url = (
            f"{BASE_URL}/"
            f"?table={table_number}"
        )


        qr = qrcode.QRCode(
            version=1,
            error_correction=
                qrcode.constants
                .ERROR_CORRECT_H,
            box_size=10,
            border=4
        )


        qr.add_data(url)

        qr.make(
            fit=True
        )


        image = qr.make_image()


        output_file = (
            f"{QR_DIRECTORY}/"
            f"table-{table_number}.png"
        )


        image.save(
            output_file
        )


        print(
            f"Created: "
            f"{output_file}"
        )

        print(
            f"URL: {url}"
        )


if __name__ == "__main__":

    generate_qr_codes()