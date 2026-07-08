---
title: "python脚本excel转Markdown(含合并单元格)"
date: 2024-05-21
description: "自从我把博客从wordpress转到hexo上就踩了很多坑，其中就包括一个很棘手的问题，就是Markdown语法的表格不支持单元格合并，即使网上有很多excel转Markdown的在线工具可以用，但是都不支持单元格合并。于是我就自己用python写了简单的转换工具出来，希望可以帮助到各位。"
tags: ["python"]
categories: ["${folder}"]
---

# 前言

自从我把博客从wordpress转到hexo上就踩了很多坑，其中就包括一个很棘手的问题，就是Markdown语法的表格不支持单元格合并，即使网上有很多excel转Markdown的在线工具可以用，但是都不支持单元格合并。于是我就自己用python写了简单的转换工具出来，希望可以帮助到各位。

# github地址

<https://github.com/helloworldbugs/excel_to_markdown>

# 代码部分
```
import pandas as pd
from openpyxl import load_workbook
import os

pwd = os.getcwd()
inputexcelfile = input('输入excel文件路径：')

def excel_to_markdown_html(input_file, output_file):
    # 使用openpyxl加载工作簿
    wb = load_workbook(input_file)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        for sheet_name in wb.sheetnames:
            sheet = wb[sheet_name]
            # 读取Excel文件
            df = pd.read_excel(input_file, sheet_name=sheet_name, header=None, engine='openpyxl')
            
            f.write('<table>\n')

            # 获取合并单元格信息
            merged_cells = sheet.merged_cells.ranges
            
            for row_idx, row in df.iterrows():
                f.write('<tr>\n')
                for col_idx, cell in enumerate(row):
                    cell_value = '' if pd.isna(cell) else cell

                    # 检查单元格是否是合并单元格的起始单元格
                    cell_ref = sheet.cell(row=row_idx+1, column=col_idx+1).coordinate
                    merge_range = None
                    for mr in merged_cells:
                        if cell_ref in mr:
                            merge_range = mr
                            break
                    
                    if merge_range and cell_ref == merge_range.coord.split(':')[0]:
                        rowspan = merge_range.size['rows']
                        colspan = merge_range.size['columns']
                        f.write(f'<td rowspan="{rowspan}" colspan="{colspan}">{cell_value}</td>\n')
                    elif not merge_range:
                        f.write(f'<td>{cell_value}</td>\n')
                f.write('</tr>\n')
            f.write('</table>\n\n')

if __name__ == "__main__":
    input_file = inputexcelfile
    output_file = pwd + '\\output.md'      # 修改为你想要的输出文件名
    excel_to_markdown_html(input_file, output_file)
```
# 使用方法

1. 先安装py库

```
pip install pandas openpyxl
```


2. 直接双击py脚本文件，然后会弹出一个cmd窗口，直接把excel表格文件拖进cmd窗口，然后回车即可。完成后会在脚本同级目录下生成一个名为`output.md`的文件
