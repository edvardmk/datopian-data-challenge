import csv
import datetime
import os
import requests
import xlrd

from enum import Enum

class Period(Enum):
    daily, weekly, monthly, annual = range(4)


def get_date(value, datemode, period):
    tup = xlrd.xldate.xldate_as_tuple(value, datemode)
    if period.name == 'annual':
        return datetime.date(tup[0], 1, 1)
    elif period.name == 'monthly':
        return datetime.date(tup[0], tup[1], 1)
    else:
        return datetime.date(tup[0], tup[1], tup[2])


def download_data(period):
    # read input
    url = f'https://www.eia.gov/dnav/ng/hist_xls/RNGWHHD{period.name[:1]}.xls'

    response = requests.get(url)
    with open('temp.xls', 'wb') as temp_xls:
        temp_xls.write(response.content)

    workbook = xlrd.open_workbook('temp.xls')
    sheet = workbook.sheets()[1]

    first_entry_index = sheet.horz_split_first_visible
    max_row_index = sheet.nrows
    datemode = workbook.datemode

    # write output
    with open(f'data/{period.name}-prices.csv', 'w', newline='') as csvfile:
        csv_writer = csv.writer(
            csvfile, delimiter=',',
            quotechar='"',
            quoting=csv.QUOTE_MINIMAL
        )
        csv_writer.writerow(['Date', 'Price'])

        for i in range(first_entry_index, max_row_index):
            date = get_date(sheet.cell_value(i, 0), datemode, period)
            price = sheet.cell_value(i, 1)
            csv_writer.writerow([date, price])
            
    if os.path.exists('temp.xls'):
        os.remove('temp.xls')


def main():
    print('====== start =======')

    for period in Period:
        download_data(period)


if __name__ == "__main__":
    main()
